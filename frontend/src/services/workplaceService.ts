import { api, buildQueryString, buildPageParams } from './api';
import {
  Workplace,
  WorkplaceCreateRequest,
  WorkplaceFilterRequest,
  PageResponse,
  PageRequest
} from '../types';

export interface WorkplaceUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categorySlug?: string;
  city?: string;
  district?: string;
  workplaceType?: string;
  squareMeter?: number;
  floorCount?: number;
  furnished?: boolean;
}

export class WorkplaceService {
  private static readonly BASE_URL = '/workplaces';

  // Tüm işyeri ilanlarını getir
  static async getAll(): Promise<Workplace[]> {
    return await api.get<Workplace[]>(this.BASE_URL);
  }

  // Sayfalı işyeri ilanlarını getir
  static async getAllPaged(pageRequest: PageRequest): Promise<PageResponse<Workplace>> {
    const params = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const queryString = buildQueryString(params);
    return await api.get<PageResponse<Workplace>>(`${this.BASE_URL}/page?${queryString}`);
  }

  // Filtrelenmiş arama
  static async search(
    filter: WorkplaceFilterRequest,
    pageRequest: PageRequest
  ): Promise<PageResponse<Workplace>> {
    const pageParams = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const allParams = { ...filter, ...pageParams };
    const queryString = buildQueryString(allParams);
    return await api.get<PageResponse<Workplace>>(`${this.BASE_URL}/search?${queryString}`);
  }

  // ID'ye göre işyeri ilanı getir
  static async getById(id: number): Promise<Workplace> {
    return await api.get<Workplace>(`${this.BASE_URL}/${id}`);
  }

  // Yeni işyeri ilanı oluştur
  static async create(workplaceData: WorkplaceCreateRequest): Promise<Workplace> {
    return await api.post<Workplace>(this.BASE_URL, workplaceData);
  }

  // İşyeri ilanı güncelle
  static async update(id: number, workplaceData: WorkplaceUpdateRequest): Promise<Workplace> {
    return await api.put<Workplace>(`${this.BASE_URL}/${id}`, workplaceData);
  }

  // İşyeri ilanı sil
  static async delete(id: number): Promise<string> {
    return await api.delete<string>(`${this.BASE_URL}/${id}`);
  }

  // Benzer işyeri ilanlarını getir
  static async getSimilar(id: number): Promise<Workplace[]> {
    return await api.get<Workplace[]>(`${this.BASE_URL}/${id}/similar`);
  }
}