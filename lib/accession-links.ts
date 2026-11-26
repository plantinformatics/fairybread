/** Genesys keys accession pages by DOI, not accession number. */
export function genesysAccessionUrl(doi: string): string {
  return `https://www.genesys-pgr.org/${doi}`;
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}
