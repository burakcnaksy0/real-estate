export interface UserStatsDTO {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
}

export interface ListingStatsDTO {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    totalViews: number;
}

export interface ActivityLogDTO {
    id: number;
    action: string;
    description: string;
    timestamp: string;
    username: string;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
