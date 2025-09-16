export interface Vendor {
    id: string;
    user_id: string;
    business_name: string;
    business_description: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    tax_id: string;
    status: "pending" | "approved" | "rejected" | "suspended";
    commission_rate: number;
    logo_url: string;
    banner_url: string;
    created_at: string;
    updated_at: string;
    users: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
        created_at: string;
    };
}

export interface VendorsResponse {
    vendors: Vendor[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    statistics: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        suspended: number;
    };
    filters: {
        status?: string;
        search?: string;
        sortBy: string;
        sortOrder: string;
    };
}
export interface VendorDetails {
    vendor: {
        id: string;
        user_id: string;
        business_name: string;
        business_description: string;
        business_address: string;
        business_phone: string;
        business_email: string;
        tax_id: string;
        status: string;
        commission_rate: number;
        logo_url: string;
        banner_url: string;
        created_at: string;
        updated_at: string;
        users: {
            id: string;
            email: string;
            full_name: string;
            phone: string;
            avatar_url: string;
            created_at: string;
        };
    };
    productStats: {
        total: number;
        active: number;
        inactive: number;
    };
    orderStats: {
        totalOrders: number;
        totalRevenue: number;
        completedOrders: number;
    };
}