import { api, buildQueryString, buildPageParams } from './api';
import {
  Vehicle,
  VehicleCreateRequest,
  VehicleFilterRequest,
  PageResponse,
  PageRequest
} from '../types';

export interface VehicleUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categorySlug?: string;
  city?: string;
  district?: string;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  transmission?: string;
  kilometer?: number;
  engineVolume?: string;
}

export class VehicleService {
  private static readonly BASE_URL = '/vehicles';

  // Tüm araç ilanlarını getir
  static async getAll(): Promise<Vehicle[]> {
    return await api.get<Vehicle[]>(this.BASE_URL);
  }

  // Sayfalı araç ilanlarını getir
  static async getAllPaged(pageRequest: PageRequest): Promise<PageResponse<Vehicle>> {
    const params = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const queryString = buildQueryString(params);
    return await api.get<PageResponse<Vehicle>>(`${this.BASE_URL}/page?${queryString}`);
  }

  // Filtrelenmiş arama
  static async search(
    filter: VehicleFilterRequest,
    pageRequest: PageRequest
  ): Promise<PageResponse<Vehicle>> {
    const pageParams = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const allParams = { ...filter, ...pageParams };
    const queryString = buildQueryString(allParams);
    return await api.get<PageResponse<Vehicle>>(`${this.BASE_URL}/search?${queryString}`);
  }

  // ID'ye göre araç ilanı getir
  static async getById(id: number): Promise<Vehicle> {
    return await api.get<Vehicle>(`${this.BASE_URL}/${id}`);
  }

  // Yeni araç ilanı oluştur
  static async create(vehicleData: VehicleCreateRequest): Promise<Vehicle> {
    return await api.post<Vehicle>(this.BASE_URL, vehicleData);
  }

  // Araç ilanı güncelle
  static async update(id: number, vehicleData: VehicleUpdateRequest): Promise<Vehicle> {
    return await api.put<Vehicle>(`${this.BASE_URL}/${id}`, vehicleData);
  }

  // Araç ilanı sil
  static async delete(id: number): Promise<string> {
    return await api.delete<string>(`${this.BASE_URL}/${id}`);
  }

  // Markaya göre araç ilanlarını getir
  static async getByBrand(brand: string, pageRequest: PageRequest): Promise<PageResponse<Vehicle>> {
    return await this.search({ brand }, pageRequest);
  }

  // Yakıt tipine göre araç ilanlarını getir
  static async getByFuelType(
    fuelType: string,
    pageRequest: PageRequest
  ): Promise<PageResponse<Vehicle>> {
    return await this.search({ fuelType: fuelType as any }, pageRequest);
  }

  // Yıl aralığına göre araç ilanlarını getir
  static async getByYearRange(
    minYear: number,
    maxYear: number,
    pageRequest: PageRequest
  ): Promise<PageResponse<Vehicle>> {
    return await this.search({ minYear, maxYear }, pageRequest);
  }

  // Kilometre aralığına göre araç ilanlarını getir
  static async getByKilometerRange(
    minKilometer: number,
    maxKilometer: number,
    pageRequest: PageRequest
  ): Promise<PageResponse<Vehicle>> {
    return await this.search({ minKilometer, maxKilometer }, pageRequest);
  }

  // Benzer araçları getir
  static async getSimilar(id: number): Promise<Vehicle[]> {
    return await api.get<Vehicle[]>(`${this.BASE_URL}/${id}/similar`);
  }
}