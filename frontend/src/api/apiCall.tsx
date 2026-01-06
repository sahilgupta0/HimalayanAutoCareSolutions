
export const login = async (email: string, password: string) => {
    try{
        const payload = {
            email: email,
            password: password,
        };
        console.log("received : ", email, password);

        console.log('Login payload:', payload);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/login`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();


        return { success: response.ok, data, error: data?.message || undefined };

    }
    catch(err){
        return { success: false, error: (err as Error).message || 'Network error' };
    }
}

export const signup = async (email: string, password: string, name: string, role: string) => {
    try{
        const payload = {
            email: email,
            password: password,
            name: name,
            role: role
        };
        console.log("received : ", email, password);

        console.log('SignUp payload:', payload);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/signup`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        return { success: response.ok, data, error: data?.message || undefined };
    }
    catch(err){
        return { success: false, error: (err as Error).message || 'Network error' };
    }
}