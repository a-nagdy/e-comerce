export interface UserType {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    avatar_url: string;
    email_verified: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
    vendors?: any[];
    customers?: any[];
}

export interface UsersResponse {
    users: UserType[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    filters: {
        role?: string;
        search?: string;
        active?: string;
        sortBy: string;
        sortOrder: string;
    };
}

export interface UserDetails {
    user: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
        role: string;
        avatar_url: string;
        email_verified: boolean;
        active: boolean;
        created_at: string;
        updated_at: string;
        vendors?: {
            id: string;
            business_name: string;
            status: string;
            commission_rate: number;
        }[];
    };
    userStats: {
        totalOrders: number;
        totalSpent: number;
        completedOrders: number;
        averageOrderValue: number;
    };
    recentActivity: {
        lastLogin: string;
        lastOrder: string;
        registrationDate: string;
    };
}
