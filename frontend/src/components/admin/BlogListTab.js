/**
 * Blog List Tab Component
 * Displays all blog posts with edit and delete functionality
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const BlogListTab = ({ blogPosts, onEdit, onDelete }) => {
    return (
        <Card className="card">
            <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                    Blog Posts ({blogPosts.length})
                </CardTitle>
                <p className="text-gray-600">Manage your blog articles</p>
            </CardHeader>
            <CardContent>
                {blogPosts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No blog posts yet. Create your first article!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {blogPosts.map((blog) => (
                            <div key={blog.id} className="border rounded-lg p-4 bg-white" data-testid={`blog-${blog.id}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-800">{blog.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{blog.excerpt}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {blog.is_published ? (
                                            <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-600">Draft</Badge>
                                        )}
                                        {blog.is_featured && (
                                            <Badge className="bg-purple-100 text-purple-700">Featured</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Created {new Date(blog.created_at).toLocaleDateString()}
                                        {blog.published_at && (
                                            <span className="ml-4">
                                                Published {new Date(blog.published_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(blog)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => onDelete(blog.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BlogListTab;
