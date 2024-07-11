import mongoose from 'mongoose'



let connection = null

export const connectMongoDB = async (url: string) => {
  try {
    if (connection == null) {
      console.log(` MongoDB Url---> ${JSON.stringify(url)}`)
      connection = await mongoose.connect(url);
      console.log(`Connection Response---> ${(connection)}`);
      return connection;
    }
    console.log('Connection already established, resusing the connection');
  } catch (error) {
    console.log('connection Error', error);
  }
}
