import {toast} from 'react-toastify';

export const handleSuccess = (msg)=>{
    toast.success(msg,{
        position: "top-right",
        autoClose:2000,
    })    
}

export const handleError = (msg)=>{
    toast.error(msg,{
        position:'top-right',
        autoClose:2000,
    });
}