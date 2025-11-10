
// A helper function to strip HTML tags from a string
function stripHtml(html: string): string {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// This is a heuristic-based syllable counter. It's not 100% accurate but works for many common English words.
function countSyllables(word: string): number {
    word = word.toLowerCase().trim();
    if (word.length === 0) return 0;
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const vowelGroups = word.match(/[aeiouy]{1,2}/g);
    
    if (!vowelGroups) return 1;

    // A special case for words ending in 'le' if the preceding consonant is not l
    if (word.length > 2 && word.endsWith('le') && !'aeiouy'.includes(word.charAt(word.length - 3)) && word.charAt(word.length-3) !== 'l') {
        return vowelGroups.length + 1;
    }
    
    return vowelGroups.length > 0 ? vowelGroups.length : 1;
}

export function getSyllableCount(html: string): number | null {
    const line = stripHtml(html);
    if (!line || line.trim() === '') {
        return null;
    }
    return line
        .trim()
        .split(/[\s-]+/)
        .filter(word => word.length > 0)
        .reduce((total, word) => total + countSyllables(word.replace(/[^a-z']/gi, '')), 0);
}