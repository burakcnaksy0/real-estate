import { api, buildQueryString, buildPageParams } from './api';
import {
  RealEstate,
  RealEstateCreateRequest,
  RealEstateFilterRequest,
  PageResponse,
  PageRequest
} from '../types';

export interface RealEstateUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categorySlug?: string;
  city?: string;
  district?: string;
  realEstateType?: string;
  roomCount?: number;
  squareMeter?: number;
  buildingAge?: number;
  floor?: number;
  heatingType?: string;
  furnished?: boolean;
}

export class RealEstateService {
  private static readonly BASE_URL = '/realestates';

  // Tüm emlak ilanlarını getir
  static async getAll(): Promise<RealEstate[]> {
    return await api.get<RealEstate[]>(this.BASE_URL);
  }

  // Sayfalı emlak ilanlarını getir
  static async getAllPaged(pageRequest: PageRequest): Promise<PageResponse<RealEstate>> {
    const params = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const queryString = buildQueryString(params);
    return await api.get<PageResponse<RealEstate>>(`${this.BASE_URL}/page?${queryString}`);
  }

  // Filtrelenmiş arama
  static async search(
    filter: RealEstateFilterRequest,
    pageRequest: PageRequest
  ): Promise<PageResponse<RealEstate>> {
    const pageParams = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const allParams = { ...filter, ...pageParams };
    const queryString = buildQueryString(allParams);
    return await api.get<PageResponse<RealEstate>>(`${this.BASE_URL}/search?${queryString}`);
  }

  // ID'ye göre emlak ilanı getir
  static async getById(id: number): Promise<RealEstate> {
    return await api.get<RealEstate>(`${this.BASE_URL}/${id}`);
  }

  // Yeni emlak ilanı oluştur
  static async create(realEstateData: RealEstateCreateRequest): Promise<RealEstate> {
    return await api.post<RealEstate>(this.BASE_URL, realEstateData);
  }

  // Emlak ilanı güncelle
  static async update(id: number, realEstateData: RealEstateUpdateRequest): Promise<RealEstate> {
    return await api.put<RealEstate>(`${this.BASE_URL}/${id}`, realEstateData);
  }

  // Emlak ilanı sil
  static async delete(id: number): Promise<string> {
    return await api.delete<string>(`${this.BASE_URL}/${id}`);
  }

  // Şehre göre emlak ilanlarını getir
  static async getByCity(city: string, pageRequest: PageRequest): Promise<PageResponse<RealEstate>> {
    return await this.search({ city }, pageRequest);
  }

  // Fiyat aralığına göre emlak ilanlarını getir
  static async getByPriceRange(
    minPrice: number,
    maxPrice: number,
    pageRequest: PageRequest
  ): Promise<PageResponse<RealEstate>> {
    return await this.search({ minPrice, maxPrice }, pageRequest);
  }

  // Oda sayısına göre emlak ilanlarını getir
  static async getByRoomCount(
    roomCount: number,
    pageRequest: PageRequest
  ): Promise<PageResponse<RealEstate>> {
    return await this.search({ minRoomCount: roomCount, maxRoomCount: roomCount }, pageRequest);
  }

  // Emlak tipine göre ilanları getir
  static async getByType(
    realEstateType: string,
    pageRequest: PageRequest
  ): Promise<PageResponse<RealEstate>> {
    return await this.search({ realEstateType: realEstateType as any }, pageRequest);
  }

  // Benzer emlak ilanlarını getir
  static async getSimilar(id: number): Promise<RealEstate[]> {
    return await api.get<RealEstate[]>(`${this.BASE_URL}/${id}/similar`);
  }
}