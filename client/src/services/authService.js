import axios from 'axios';

const getResponse = (res) => {
    return res.json().then(data => data);
}

const catchErrors = (err) => {
    if (err.response.status != 401){
        return err.response.data;
    }
    else {
        return { isAuthenticated : false, user : { username : "" } };
    }
}

export default {
    login : user => {
        /* return fetch('/users/login', {
            method : "post",
            body : JSON.stringify(user),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).then(res => {
            if (res.status !== 401){
                return res.json().then(data => {
                    return data;
                });
            }
            else{
                return { isAuthenticated : false, user : { username : "" } };
            }
        }); */
        return axios.post('/users/login', user).then(getResponse).catch(catchErrors);
    },
    register : user => {
        /* return fetch('/users/register', {
            method : "post",
            body : JSON.stringify(user),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).then(res => {
            if (res.status !== 401){
                return res.json().then(data => {
                    return data;
                });
            }
            else{
                return { isAuthenticated : false, user : { username : "" } };
            }
        }); */
        return axios.post('/users/register', user).then(getResponse).catch(catchErrors);
    },
    forgotPassword : user => {
        /* return fetch('/users/forgot', {
            method : "post",
            body : JSON.stringify(user),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).then(res => {
            if (res.status !== 401){
                return res.json().then(data => {
                    return data;
                });
            }
            else{
                return { isAuthenticated : false, user : { username : "" } };
            }
        }); */
        return axios.post('/users/forgot', user).then(getResponse).catch(catchErrors);
    },
    logout : () => {
        /* return fetch('/users/logout').then(res => res.json()).then(data => data); */
        return axios.get('/users/logout').then(getResponse).catch(catchErrors);
    },
    isAuthenticated : () => {
        /* return fetch('/users/authenticated')
                .then(res => {
                    if (res.status !== 401){
                        return res.json().then(data => {
                            return data;
                        });
                    }
                    else{
                        return { isAuthenticated : false, user : { username : "" } };
                    }
                }); */
        return axios.get('/users/authenticated').then(getResponse).catch(catchErrors);
    },
    changePassword : (username, password) => {
        return axios.post('/users/changepassword', {username, password}).then(getResponse).catch(catchErrors);
    } 
}