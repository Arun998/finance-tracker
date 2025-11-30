/**
 * Map merchant names to expense categories
 * Uses keyword matching with confidence scores
 */

const merchantCategoryMap = {
    food: {
        keywords: [
            'swiggy', 'zomato', 'dominos', 'mcd', 'mcdonalds', 'burger king',
            'kfc', 'pizza hut', 'subway', 'restaurant', 'cafe', 'coffee', 'bakery',
            'dunkin', 'starbucks', 'biryani', 'dhaba', 'dhabha', 'food', 'delivery',
            'uber eats', 'faasos', 'chai', 'samosa', 'pizza', 'noodles',
            'hotel', 'mess', 'canteen', 'grocery', 'supermarket', 'bms', 'inox'
        ],
        emoji: '🍽️',
        color: '#FF6B6B'
    },
    transport: {
        keywords: [
            'uber', 'ola', 'rapido', 'metro', 'bus', 'railway', 'train',
            'ticket', 'petrol', 'diesel', 'fuel', 'gas', 'parking', 'toll',
            'flight', 'airline', 'taxi', 'cab', 'autorickshaw', 'auto', 'bike',
            'bike sharing', 'car', 'automobile', 'transport', 'travel', 'meru',
            'google', 'maps', 'navigation'
        ],
        emoji: '🚗',
        color: '#4ECDC4'
    },
    shopping: {
        keywords: [
            'amazon', 'flipkart', 'myntra', 'mall', 'store', 'shop', 'retail',
            'clothing', 'dress', 'shoes', 'apparels', 'fashion', 'cloth',
            'h&m', 'forever 21', 'zara', 'mango', 'uniqlo', 'gap',
            'watch', 'jewellery', 'jewelry', 'ring', 'necklace', 'earring',
            'handbag', 'purse', 'bag', 'sunglasses', 'glasses', 'spectacles',
            'nike', 'adidas', 'puma', 'reebok', 'sports', 'equipment',
            'yousta', 'attibele', 'electronic', 'electronics', 'city'
        ],
        emoji: '🛍️',
        color: '#FFE66D'
    },
    entertainment: {
        keywords: [
            'netflix', 'amazon prime', 'prime video', 'hotstar', 'disney plus',
            'sony liv', 'zee', 'youtube', 'gaming', 'game', 'playstation',
            'xbox', 'steam', 'movie', 'cinema', 'theatre', 'theater',
            'ticket', 'concert', 'music', 'spotify', 'gaana', 'wynk',
            'entertainment', 'series', 'webseries', 'digital', 'subscription'
        ],
        emoji: '🎬',
        color: '#DDA0DD'
    },
    bills: {
        keywords: [
            'electricity', 'water', 'internet', 'broadband', 'wifi', 'mobile',
            'phone', 'prepaid', 'postpaid', 'datacard', 'airtel', 'jio', 'vi',
            'vodafone', 'idea', 'bsnl', 'electricity board', 'water board',
            'utility', 'power', 'deposit', 'payment', 'bill', 'rent',
            'property', 'housing', 'loan', 'emi', 'subscription'
        ],
        emoji: '💳',
        color: '#95E1D3'
    },
    health: {
        keywords: [
            'pharmacy', 'hospital', 'doctor', 'clinic', 'medical', 'medicine',
            'health', 'dental', 'dentist', 'lab', 'pathology', 'test',
            'diagnostic', 'vaccine', 'vaccination', 'ayurveda', 'yoga',
            'gym', 'fitness', 'sports', 'wellness', 'spa', 'massage',
            'healthcare', 'insurance', 'mediclaim', 'nursing'
        ],
        emoji: '⚕️',
        color: '#A8E6CF'
    },
    other: {
        keywords: [],
        emoji: '?',
        color: '#999999'
    }
};

/**
 * Categorize transaction based on merchant name
 * Returns category with confidence score
 */
export const categorizeMerchant = (merchantName) => {
    if (!merchantName || merchantName.length === 0) {
        return {
            category: 'Other',
            confidence: 0,
            emoji: '?'
        };
    }
    
    const lowerMerchant = merchantName.toLowerCase();
    const scores = {};
    
    // Calculate score for each category
    for (const [category, data] of Object.entries(merchantCategoryMap)) {
        let score = 0;
        
        // Check keyword matches
        for (const keyword of data.keywords) {
            if (lowerMerchant.includes(keyword)) {
                score += 1;
                
                // Boost score for exact matches or near-exact
                if (lowerMerchant === keyword || 
                    lowerMerchant.startsWith(keyword) ||
                    lowerMerchant.endsWith(keyword)) {
                    score += 2;
                }
            }
        }
        
        scores[category] = score;
    }
    
    // Find best match
    const bestCategory = Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (bestCategory && bestCategory[1] > 0) {
        const category = bestCategory[0];
        const confidence = Math.min(100, (bestCategory[1] / 3) * 100); // Max 100%
        
        return {
            category: capitalizeFirst(category),
            confidence: Math.round(confidence),
            emoji: merchantCategoryMap[category].emoji,
            keywords: merchantCategoryMap[category].keywords
        };
    }
    
    // Default to Other
    return {
        category: 'Other',
        confidence: 0,
        emoji: '?',
        keywords: []
    };
};

/**
 * Categorize multiple transactions
 */
export const categorizeTransactions = (transactions) => {
    return transactions.map(tx => ({
        ...tx,
        categoryInfo: categorizeMerchant(tx.merchant || tx.description)
    }));
};

/**
 * Get all available categories
 */
export const getAllCategories = () => {
    return Object.keys(merchantCategoryMap).map(key => ({
        name: capitalizeFirst(key),
        emoji: merchantCategoryMap[key].emoji,
        color: merchantCategoryMap[key].color,
        keywords: merchantCategoryMap[key].keywords
    }));
};

/**
 * Check if category is valid
 */
export const isValidCategory = (category) => {
    const validCategories = [
        'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'
    ];
    return validCategories.includes(category);
};

/**
 * Get category emoji
 */
export const getCategoryEmoji = (category) => {
    const normalized = category.toLowerCase();
    return merchantCategoryMap[normalized]?.emoji || '?';
};

/**
 * Get category color
 */
export const getCategoryColor = (category) => {
    const normalized = category.toLowerCase();
    return merchantCategoryMap[normalized]?.color || '#999999';
};

/**
 * Helper: Capitalize first letter
 */
const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Analyze categorization accuracy
 * Returns stats on how many transactions were categorized with high confidence
 */
export const analyzeCategorizationAccuracy = (categorizedTransactions) => {
    const stats = {
        total: categorizedTransactions.length,
        highConfidence: 0,      // >= 80%
        mediumConfidence: 0,    // 40-79%
        lowConfidence: 0,       // < 40%
        categories: {}
    };
    
    for (const tx of categorizedTransactions) {
        const confidence = tx.categoryInfo?.confidence || 0;
        const category = tx.categoryInfo?.category || 'Other';
        
        // Count by confidence
        if (confidence >= 80) stats.highConfidence++;
        else if (confidence >= 40) stats.mediumConfidence++;
        else stats.lowConfidence++;
        
        // Count by category
        stats.categories[category] = (stats.categories[category] || 0) + 1;
    }
    
    // Calculate percentages
    stats.highConfidencePercent = Math.round((stats.highConfidence / stats.total) * 100);
    stats.mediumConfidencePercent = Math.round((stats.mediumConfidence / stats.total) * 100);
    stats.lowConfidencePercent = Math.round((stats.lowConfidence / stats.total) * 100);
    
    return stats;
};

/**
 * Get merchant categories for fast lookup (for UI)
 */
export const getMerchantKeywords = (category) => {
    const normalized = category.toLowerCase();
    return merchantCategoryMap[normalized]?.keywords || [];
};
