interface Customer {
  _id: string;
  name: string;
  businessName: string;
  panNumber: string;
  district: string;
  area: string;
  phoneNumber: string;
}

export const login = async (email: string, password: string) => {
    try{
        const payload = {
            email: email,
            password: password,
        };
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

export const userFetchAll = async ()  => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/fetchAllUsers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to fetch users' };
        }

        const data = await response.json();
        return { success: true, data : data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};

export const createCustomer = async ( customer ) => {  
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/customer/createCustomer`, 
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

export const updateCustomer = async ( customer : Customer ) => {  
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/customer/updateCustomer`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customer),
            }
        )
        if(!response.ok){
            const errorData = await response.json();
            return { success: false,  error: errorData?.message || 'Failed to update customer' };
        }
        const data = await response.json();
        return { success: true, data };
    }
    catch(err){
        return { success: false, error: (err as Error).message || 'Network error' };
    }
}

export const deleteCustomer = async ( customerId : string ) => {
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/customer/deleteCustomer/${customerId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        if(!response.ok){
            const errorData = await response.json();
            return { success: false,  error: errorData?.message || 'Failed to delete customer' };
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/customer/getCustomer`, {
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
        return { success: true, data : data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};

export const getMyRequestsFromBackend = async ( salesPersonId : string )  => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/sales/personal-sales/${salesPersonId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to fetch sales requests' };
        }
        const data = await response.json();
        return { success: true, data : data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};

export const addNewSalesRequest = async ( salesRequest : any ) => {  
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/sales/createSale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(salesRequest),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to create sales request' };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};

export const getAllSales = async ()  => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/sales/all-sales`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to fetch sales' };
        }
        const data = await response.json();
        return { success: true, data : data };
    }
    catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }  
};

export const acceptSale = async ( saleId : string ) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/sales/accept-sale/${saleId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }); 
        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to accept sale' };
        }
        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};

export const rejectSale = async ( saleId : string ) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/sales/reject-sale/${saleId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to reject sale' };
        }
        const data = await response.json();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};

export const createProduct = async ( product : any ) => {  
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/product/createProduct`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            }
        )
        if(!response.ok){
            const errorData = await response.json();
            return { success: false,  error: errorData?.message || 'Failed to create/update product' };
        }
        const data = await response.json();
        return { success: true, data };
    }
    catch(err){
        return { success: false, error: (err as Error).message || 'Network error' };
    }   
}

export const getProducts = async ()  => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/product/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData?.message || 'Failed to fetch products' };
        }  
        const data = await response.json();
        return { success: true, data : data };
    } catch (err) {
        return { success: false, error: (err as Error).message || 'Network error' };
    }
};