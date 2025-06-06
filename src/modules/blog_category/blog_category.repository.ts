import { IBlogCategory } from "./blog_category.interface";
import { BlogCategoryModel } from "./blog_category.model";

export default class BlogCategoryRepository {
    public async createBlogCategory(model: IBlogCategory): Promise<IBlogCategory> {
        const blogCategory = await BlogCategoryModel.create(model);
        if (!blogCategory) {
            throw new Error('Blog category not created');
        }
        return blogCategory;
    }

    public async updateBlogCategory(id: string, model: IBlogCategory): Promise<IBlogCategory> {
        const blogCategory = await BlogCategoryModel.findByIdAndUpdate(id, model, { new: true });
        if (!blogCategory) {
            throw new Error('Blog category not found');
        }
        return blogCategory;
    }

    public async deleteBlogCategory(id: string): Promise<IBlogCategory> {
        const blogCategory = await BlogCategoryModel.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );
        if (!blogCategory) {
            throw new Error('Blog category not found');
        }
        return blogCategory;
    }

    public async getBlogCategoryById(id: string): Promise<IBlogCategory> {
        const blogCategory = await BlogCategoryModel.findById(id);
        if (!blogCategory) {
            throw new Error('Blog category not found');
        }
        return blogCategory;
    }

    public async getBlogCategories(): Promise<IBlogCategory[]> {
        return BlogCategoryModel.find();
    }

    public async getBlogCategoriesWithPagination(query: any): Promise<IBlogCategory[]> {
        return BlogCategoryModel.find(query);
    }
}