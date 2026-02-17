export type PCAFileInfoEntry = {
    fileUrl: string;
    doiTitle: string;
    doiUrl: string;
};

export const PCAFileInfo = new Map<string, PCAFileInfoEntry>([
    ['Barley', {
        fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/barley-pcs.tsv',
        doiTitle: 'AGG Barley - Release 240806',
        doiUrl: 'https://doi.org/10.7910/DVN/H6SNVM'
    }],
    ['Wheat', {
        fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/wheat-release1-pca.txt',
        doiTitle: 'AGG Wheat - Release 240806',
        doiUrl: 'https://doi.org/10.7910/DVN/CRSI0B'
    }],
    ['Lentil', {
        fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/lentil-pcs.txt',
        doiTitle: 'AGG Lentil - Release 250228',
        doiUrl: 'https://doi.org/10.7910/DVN/T0TDAS'
    }],
    ['Field Pea', {
        fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/fieldpea-pcs.txt',
        doiTitle: 'AGG Field pea - Release 250801',
        doiUrl: 'https://doi.org/10.7910/DVN/A6WGYS'
    }],
    ['Chickpea', {
        fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/chickpea-pcs.txt',
        doiTitle: 'AGG Chickpea - Release 250505',
        doiUrl: 'https://doi.org/10.7910/DVN/ECQ4NC'
    }],
    ['Lupin', {
        fileUrl: 'https://bry2ac73eslo6pzp.public.blob.vercel-storage.com/lupin-pcs.txt',
        doiTitle: 'AGG Lupin - Release 251113',
        doiUrl: 'https://doi.org/10.7910/DVN/FVTFIL'
    }]
]);