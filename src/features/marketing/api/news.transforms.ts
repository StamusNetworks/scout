import { News } from '../model/news';
import { NewsDto } from './news.dto';

export const toNews = (dto: NewsDto): News => ({
  title: dto.title,
  link: dto.link,
  publishedAt: dto.pubDate,
  description: dto.description,
  categories: dto.categories,
});
