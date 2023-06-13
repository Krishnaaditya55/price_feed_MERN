import axios from 'axios';
const basePath = 'http://localhost:5000';

export  const loadData = (page, limit) =>{
    const url = `${basePath}/?page=${page}&limit=${limit}`;
    return  axios.get(url); 
}
export  const uploadFile = (file) =>{
    const data = new FormData();
    data.append(`uploadcsv`, file, file.name);
    return  axios.post(`${basePath}/uploadcsv`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-rapidapi-host": "file-upload8.p.rapidapi.com",
        "x-rapidapi-key": "your-rapidapi-key-here",
      },
    })
}
export  const updateRecord = (row) =>{
    return  axios.post(`${basePath}/updateRec`, row)
}