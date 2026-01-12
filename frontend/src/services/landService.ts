import { api, buildQueryString, buildPageParams } from './api';
import {
  Land,
  LandCreateRequest,
  LandFilterRequest,
  PageResponse,
  PageRequest
} from '../types';

export interface LandUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categorySlug?: string;
  city?: string;
  district?: string;
  landType?: string;
  squareMeter?: number;
  zoningStatus?: string;
  parcelNumber?: number;
  islandNumber?: number;
}

export class LandService {
  private static readonly BASE_URL = '/lands';

  // Tüm arsa ilanlarını getir
  static async getAll(): Promise<Land[]> {
    return await api.get<Land[]>(this.BASE_URL);
  }

  // Sayfalı arsa ilanlarını getir
  static async getAllPaged(pageRequest: PageRequest): Promise<PageResponse<Land>> {
    const params = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const queryString = buildQueryString(params);
    return await api.get<PageResponse<Land>>(`${this.BASE_URL}/page?${queryString}`);
  }

  // Filtrelenmiş arama
  static async search(
    filter: LandFilterRequest,
    pageRequest: PageRequest
  ): Promise<PageResponse<Land>> {
    const pageParams = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const allParams = { ...filter, ...pageParams };
    const queryString = buildQueryString(allParams);
    return await api.get<PageResponse<Land>>(`${this.BASE_URL}/search?${queryString}`);
  }

  // ID'ye göre arsa ilanı getir
  static async getById(id: number): Promise<Land> {
    return await api.get<Land>(`${this.BASE_URL}/${id}`);
  }

  // Yeni arsa ilanı oluştur
  static async create(landData: LandCreateRequest): Promise<Land> {
    return await api.post<Land>(this.BASE_URL, landData);
  }

  // Arsa ilanı güncelle
  static async update(id: number, landData: LandUpdateRequest): Promise<Land> {
    return await api.put<Land>(`${this.BASE_URL}/${id}`, landData);
  }

  // Arsa ilanı sil
  static async delete(id: number): Promise<string> {
    return await api.delete<string>(`${this.BASE_URL}/${id}`);
  }

  // Benzer arsa ilanlarını getir
  static async getSimilar(id: number): Promise<Land[]> {
    return await api.get<Land[]>(`${this.BASE_URL}/${id}/similar`);
  }
}