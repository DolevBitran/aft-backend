import express from 'express';
import User, { IUser, IUserDocument } from '../models/User';
import asyncWrapper from '../middleware/async';
import { createCustomError } from '../errors/custom-error';
import mongoose, { Query } from 'mongoose';
import Product, { IProduct, IProductDocument } from '../models/Product';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { Blob } from 'buffer'
import Asset from '../models/Asset';

const CHUNK_SIZE = 1024 * 1024; // 100MB chunks

cloudinary.config({
    cloud_name: 'dxjgmitru',
    api_key: '794655344446673',
    api_secret: 'hL-XvtfOmwv45v6CmYTGElaxjq8'
});

interface IChunk {
    fileIdentifier: string,
    contentRange: string
    // @ts-ignore
    filename: string,
    // @ts-ignore
    path: string,
    offset: number,
    totalSize: number,
    chunkIndex: number,
    chunkCount: number,
    mimeType: string,
    fileExtension: string
}

const uploadQueue: { [id: string]: IChunk[] } = {}


const deleteTempFile = (error: UploadApiErrorResponse, result: UploadApiResponse, filePath: string) => {
    if (result) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.log(`Error while deleting ${result.original_filename}.${result.original_extension}`, err)
        }
    } else {
        console.log(error);
    }
}

const addChunk = async (fileIdentifier: string, chunk: IChunk) => {
    uploadQueue[fileIdentifier] = [...(uploadQueue[fileIdentifier] || []), chunk]

    if (uploadQueue[fileIdentifier].length === chunk.chunkCount) {
        const sortedChunkArray = uploadQueue[fileIdentifier].sort((a, b) => a.chunkIndex - b.chunkIndex)

        const fileName = `${fileIdentifier}.${chunk.fileExtension}`
        const file = await Promise.all(sortedChunkArray.map(c => getFile(c.path)));
        // Merge all chunks to get file blob
        const completeFile = file.map(f => b64toBlob(f, 'image/jpg', CHUNK_SIZE))
        const fileBlob = new Blob(completeFile)
        const buff = Buffer.from(await fileBlob.arrayBuffer());
        // Write File to Disk
        fs.writeFileSync(fileName, buff);
        // Delete file chunks
        uploadQueue[fileIdentifier].forEach(c => fs.unlink(c.path, (err) => {
            if (err) {
                throw err
            }
        }))

        console.log(`File: ${fileIdentifier} uploaded from web`)
        // Upload to cloudinary

        const filePath = path.join(__dirname + `../../../${fileName}`)
        const result = await uploadToCloudinary(filePath, fileIdentifier)

        console.log('Successfully uploaded to Cloudinary', { result })
        const asset = await Asset.create({
            asset_id: result.asset_id,
            public_id: result.public_id,
            original_filename: result.original_filename + result.original_extension || '',
            source: result.secure_url
        })

        return asset
    }
}

// @ts-ignore
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

const getFile = (filename: string): Promise<string | NodeJS.ErrnoException> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding: 'base64' }, (err: NodeJS.ErrnoException, data: string) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}

const acceptChunk = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const fileIdentifier = req.headers['x-content-id'] as string
    console.log({
        body: {
            ...req.body, files: req.files
        }
    })
    if (req.files?.length) {
        const chunk: IChunk = {
            fileIdentifier,
            contentRange: req.headers['content-range'],
            // @ts-ignore
            filename: req.files[0].filename,
            // @ts-ignore
            path: req.files[0].destination + '/' + req.files[0].filename,
            offset: Number(req.body.offset),
            totalSize: Number(req.body.totalSize),
            chunkIndex: Number(req.body.chunkIndex),
            chunkCount: Number(req.body.chunkCount),
            mimeType: req.body.mimeType,
            fileExtension: req.body.fileExtension
        }

        console.log(`Chunk ${req.body.chunkIndex} accepted`)
        const asset = await addChunk(fileIdentifier, chunk)

        // @ts-ignore
        // fs.readFile(req.files[0].destination + '/' + req.files[0].filename, (err, data) => {
        //     // let buf = Buffer.concat(req.files);
        //     const bufferBase64 = data.toString('base64');
        //     // console.log({ data, bufferBase64 })
        // });

        res.status(200).json({ success: true, asset })// fileIdentifier, chunkIndex: req.body.chunkIndex })
    }

    // cloudinary.uploader.upload("")
    // const { title, src, description, categories }: IProduct = req.body
    // const product: IProduct = await Product.create({ title, src, description, categories })
    // res.status(201).json({ success: true, product })
})

const uploadToCloudinary = async (filePath: string, fileIdentifier: string) =>
    await cloudinary.uploader.upload(
        filePath,
        { public_id: fileIdentifier },
        (err, res) => deleteTempFile(err, res, filePath)
    );

const acceptChunkMobile = asyncWrapper(async (req: express.Request, res: express.Response) => {
    const fileIdentifier = req.headers['x-content-id'] as string

    if (req.files?.length) {

        console.log(`File: ${fileIdentifier} uploaded from mobile`)

        const fileName = `${fileIdentifier}.${req.body.fileExtension}`
        // const fileBlob = new Blob(completeFile)
        // @ts-ignore
        // const buff = Buffer.from(await req.files[0].arrayBuffer());
        // fs.writeFileSync(fileName, buff);
        const filePath = path.join(req.files[0].destination + '/' + req.files[0].filename)

        const result = await uploadToCloudinary(filePath, fileIdentifier)

        console.log('Successfully uploaded to Cloudinary', { result })
        const asset = await Asset.create({
            asset_id: result.asset_id,
            public_id: result.public_id,
            original_filename: result.original_filename + result.original_extension || '',
            source: result.secure_url
        })

        return res.status(200).json({ success: true, asset })// fileIdentifier, chunkIndex: req.body.chunkIndex })
    }

    // cloudinary.uploader.upload("")
    // const { title, src, description, categories }: IProduct = req.body
    // const product: IProduct = await Product.create({ title, src, description, categories })
    // res.status(201).json({ success: true, product })
})


const uploadImage = asyncWrapper(async (req: express.Request, res: express.Response) => {
    // const formData = new FormData();

    // for (let i = 0; i < files.length; i++) {
    //     let file = files[i];
    //     formData.append("file", file);
    //     formData.append("upload_preset", "docs_upload_example_us_preset");

    // fetch(url, {
    //     method: "POST",
    //     body: formData
    // })
    //     .then((response) => {
    //         return response.text();
    //     })
    //     .then((data) => {
    //         document.getElementById("data").innerHTML += data;
    //     });
    // }

    cloudinary.uploader.upload("")
    // const { title, src, description, categories }: IProduct = req.body
    // const product: IProduct = await Product.create({ title, src, description, categories })
    // res.status(201).json({ success: true, product })
})


export {
    acceptChunk,
    acceptChunkMobile,
    uploadImage
}