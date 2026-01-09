import { api, buildQueryString, buildPageParams } from './api';
import { BaseListing, PageResponse, PageRequest } from '../types';

export class ListingService {
  private static readonly BASE_URL = '/listings';

  // Tüm ilanları getir (genel)
  static async getAll(): Promise<BaseListing[]> {
    return await api.get<BaseListing[]>(this.BASE_URL);
  }

  // Sayfalı tüm ilanları getir (genel)
  static async getAllPaged(pageRequest: PageRequest): Promise<PageResponse<BaseListing>> {
    const params = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const queryString = buildQueryString(params);
    return await api.get<PageResponse<BaseListing>>(`${this.BASE_URL}/page?${queryString}`);
  }

  // Son eklenen ilanları getir
  static async getLatest(limit: number = 10): Promise<BaseListing[]> {
    const response = await this.getAllPaged({ 
      page: 0, 
      size: limit, 
      sort: 'createdAt,desc' 
    });
    return response.content;
  }

  // Popüler ilanları getir (örnek: en çok görüntülenen)
  static async getPopular(limit: number = 10): Promise<BaseListing[]> {
    // Backend'de view count yoksa, son eklenenler döndürülebilir
    return await this.getLatest(limit);
  }

  // Şehre göre ilanları getir
  static async getByCity(city: string, pageRequest: PageRequest): Promise<PageResponse<BaseListing>> {
    // Bu endpoint backend'de yok, ancak gelecekte eklenebilir
    // Şimdilik tüm ilanları getirip frontend'de filtreleyebiliriz
    const allListings = await this.getAllPaged(pageRequest);
    const filteredContent = allListings.content.filter(listing => 
      listing.city.toLowerCase().includes(city.toLowerCase())
    );
    
    return {
      ...allListings,
      content: filteredContent,
      numberOfElements: filteredContent.length
    };
  }

  // Kategoriye göre ilanları getir
  static async getByCategory(categorySlug: string, pageRequest: PageRequest): Promise<PageResponse<BaseListing>> {
    // Bu endpoint backend'de yok, ancak gelecekte eklenebilir
    const allListings = await this.getAllPaged(pageRequest);
    const filteredContent = allListings.content.filter(listing => 
      listing.categorySlug === categorySlug
    );
    
    return {
      ...allListings,
      content: filteredContent,
      numberOfElements: filteredContent.length
    };
  }

  // Fiyat aralığına göre ilanları getir
  static async getByPriceRange(
    minPrice: number, 
    maxPrice: number, 
    pageRequest: PageRequest
  ): Promise<PageResponse<BaseListing>> {
    const allListings = await this.getAllPaged(pageRequest);
    const filteredContent = allListings.content.filter(listing => 
      listing.price >= minPrice && listing.price <= maxPrice
    );
    
    return {
      ...allListings,
      content: filteredContent,
      numberOfElements: filteredContent.length
    };
  }

  // Arama (title ve description'da)
  static async search(
    query: string, 
    pageRequest: PageRequest
  ): Promise<PageResponse<BaseListing>> {
    const allListings = await this.getAllPaged(pageRequest);
    const searchTerm = query.toLowerCase();
    const filteredContent = allListings.content.filter(listing => 
      listing.title.toLowerCase().includes(searchTerm) ||
      (listing.description && listing.description.toLowerCase().includes(searchTerm))
    );
    
    return {
      ...allListings,
      content: filteredContent,
      numberOfElements: filteredContent.length
    };
  }
}