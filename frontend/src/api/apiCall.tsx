interface Customer {
  id: string;
  name: string;
  businessName: string;
  panNumber: string;
  area: string;
  phoneNumber: string;
}

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

        if(!response.ok){
            const errorData = await response.json();
            return { success: false,  error: errorData?.message || 'Server Sider Error' };
        }

        const data = await response.json();

        return { success: response.ok, data, error: data?.message || undefined };
    }
    catch(err){
        return { success: false, error: (err as Error).message || 'Network error' };
    }
}

export const createCustomer = async ( customer : Customer ) => {  
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/createCustomer`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customer),
            }
        )

        if(!response.ok){
            const errorData = await response.json();
            return { success: false,  error: errorData?.message || 'Failed to create customer' };
        }
        const data = await response.json();
        return { success: true, data };
    }
    catch(err){
        return { success: false, error: (err as Error).message || 'Network error' };
    }


}


export const getCustomersFromBackend = async ()  => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/customers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to fetch customers' };
        }

        const data = await response.json();
        console.log("Fetched customers in api frontend:", data);
        return { success: true, data : data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};