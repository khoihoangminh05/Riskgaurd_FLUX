export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]) {
    return inputs
        .flat()
        .filter(Boolean)
        .map(input => {
            if (typeof input === 'object' && input !== null) {
                return Object.entries(input)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key)
                    .join(' ');
            }
            return input;
        })
        .join(' ');
}
