export const itemsQuery = (query: Record<string, any>, items: Record<string, any>): Record<string, any> => {
    for (const key in items) {
        if (items[key] || items[key] === false) {
            query = {
                ...query,
                [key]: items[key],
            };
        }
    }
    return query;
};
