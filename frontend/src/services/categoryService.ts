import { api, buildQueryString, buildPageParams } from './api';
import { Category, PageResponse, PageRequest } from '../types';

export interface CategoryCreateRequest {
  name: string;
  slug: string;
}

export interface CategoryUpdateRequest {
  name?: string;
  slug?: string;
  active?: boolean;
}

export class CategoryService {
  private static readonly BASE_URL = '/categories';

  // Tüm kategorileri getir
  static async getAll(): Promise<Category[]> {
    return await api.get<Category[]>(this.BASE_URL);
  }

  // Sayfalı kategorileri getir
  static async getAllPaged(pageRequest: PageRequest): Promise<PageResponse<Category>> {
    const params = buildPageParams(pageRequest.page, pageRequest.size, pageRequest.sort);
    const queryString = buildQueryString(params);
    return await api.get<PageResponse<Category>>(`${this.BASE_URL}/page?${queryString}`);
  }

  // ID'ye göre kategori getir
  static async getById(id: number): Promise<Category> {
    return await api.get<Category>(`${this.BASE_URL}/${id}`);
  }

  // Yeni kategori oluştur
  static async create(categoryData: CategoryCreateRequest): Promise<Category> {
    return await api.post<Category>(this.BASE_URL, categoryData);
  }

  // Kategori güncelle
  static async update(id: number, categoryData: CategoryUpdateRequest): Promise<Category> {
    return await api.put<Category>(`${this.BASE_URL}/${id}`, categoryData);
  }

  // Kategori sil
  static async delete(id: number): Promise<string> {
    return await api.delete<string>(`${this.BASE_URL}/${id}`);
  }

  // Aktif kategorileri getir
  static async getActiveCategories(): Promise<Category[]> {
    const categories = await this.getAll();
    return categories.filter(category => category.active);
  }

  // Slug'a göre kategori bul
  static async getBySlug(slug: string): Promise<Category | undefined> {
    const categories = await this.getAll();
    return categories.find(category => category.slug === slug);
  }
}