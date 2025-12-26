/**
 * Admin utility functions and constants
 * Extracted from AdminPanel.js
 */

// Helper function to check if salary value should show currency symbol
export const shouldShowCurrency = (value) => {
    if (!value) return false;
    return /\d/.test(value);
};

// Helper function to format salary with currency
export const formatSalary = (value, currency) => {
    if (!value) return '';
    if (shouldShowCurrency(value)) {
        const symbol = currency === 'USD' ? '$' : '₹';
        return `${symbol}${value}`;
    }
    return value;
};

// Job categories configuration
export const jobCategories = [
    { value: 'doctors', label: '🩺 Doctors' },
    { value: 'pharmacy', label: '💊 Pharmacy' },
    { value: 'dentist', label: '🦷 Dentist' },
    { value: 'nurses', label: '👩‍⚕️ Nurses' },
    { value: 'physiotherapy', label: '🏃‍♂️ Physiotherapy' },
    { value: 'all', label: '🏥 All Categories' }
];

// Image compression utility
export const compressImage = (file, maxSizeKB = 800) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const maxDimension = 1200;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        if (blob.size <= maxSizeKB * 1024 || quality <= 0.5) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            quality -= 0.1;
                            tryCompress();
                        }
                    }, 'image/jpeg', quality);
                };

                tryCompress();
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

// Default states for forms
export const defaultJobState = {
    title: '',
    company: '',
    location: '',
    description: '',
    salary_min: '',
    salary_max: '',
    currency: 'INR',
    job_type: 'full_time',
    categories: [],
    requirements: [],
    benefits: [],
    is_external: false,
    external_url: ''
};

export const defaultBlogState = {
    title: '',
    excerpt: '',
    content: '',
    category: 'healthcare',
    tags: [],
    is_published: false,
    is_featured: false,
    featured_image: null,
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    faqs: []
};

export const defaultSeoState = {
    page_type: 'home',
    title: '',
    description: '',
    keywords: [],
    og_image: '',
    canonical_url: ''
};
