import mongoose from 'mongoose'

const config: mongoose.ConnectOptions = {
    // dbName: 'test',
};

mongoose.set('strictQuery', true);
const connectDB = (url: string) => {
    return mongoose.connect(url, config)
        .then(() => console.log("App is connected to mongoDB..."))
        .catch((err) => console.log(err))
}


export default connectDB