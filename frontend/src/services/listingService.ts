import { api, buildQueryString, buildPageParams } from './api';
import { BaseListing, PageResponse, PageRequest, ListingStatus } from '../types';

export interface GeneralFilterRequest {
  city?: string;
  district?: string;
  categorySlug?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
}

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

  // Filtrelenmiş arama - Backend'deki yeni search endpoint'ini kullanır
  static async search(
    filter: GeneralFilterRequest,
    pageRequest: PageRequest
  ): Promise<PageResponse<BaseListing>> {
    const pageParams = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const allParams = { ...filter, ...pageParams };
    const queryString = buildQueryString(allParams);
    return await api.get<PageResponse<BaseListing>>(`${this.BASE_URL}/search?${queryString}`);
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
    return await this.search({ city }, pageRequest);
  }

  // Kategoriye göre ilanları getir
  static async getByCategory(categorySlug: string, pageRequest: PageRequest): Promise<PageResponse<BaseListing>> {
    return await this.search({ categorySlug }, pageRequest);
  }

  // Fiyat aralığına göre ilanları getir
  static async getByPriceRange(
    minPrice: number,
    maxPrice: number,
    pageRequest: PageRequest
  ): Promise<PageResponse<BaseListing>> {
    return await this.search({ minPrice, maxPrice }, pageRequest);
  }

  // Kategori istatistiklerini getir
  static async getCategoryStats(): Promise<CategoryStatsResponse[]> {
    return await api.get<CategoryStatsResponse[]>(`${this.BASE_URL}/stats`);
  }

  // Kullanıcının kendi ilanlarını getir
  static async getMyListings(): Promise<BaseListing[]> {
    return await api.get<BaseListing[]>(`${this.BASE_URL}/my-listings`);
  }
}

export interface CategoryStatsResponse {
  categorySlug: string;
  categoryName: string;
  count: number;
}