import { FilterFormatDto } from '../dto';

export function formatPage(
  take?: number,
  page?: number,
  keyword?: string,
): FilterFormatDto {
  const take_filter = take ?? 10;
  const page_filter = page ?? 1;
  const keyword_filter = keyword ?? '';

  return new FilterFormatDto(take_filter, page_filter, keyword_filter);
}
