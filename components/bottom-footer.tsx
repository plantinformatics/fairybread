export default function BottomFooter() {
  return (
    <div className="flex items-start justify-between mt-6 mb-6 gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            The <a href="https://agg.plantinformatics.io/strategic-partnership/" target="_blank" rel="noopener noreferrer" className="font-bold">Australian Grains Genebank (AGG)</a> Strategic 
            Partnership is a $30M joint investment between the Victorian State Government and 
            the <a href="https://grdc.com.au/" target="_blank" rel="noopener noreferrer" className="font-bold">Grains Research and Development Corporation (GRDC)</a> that 
            aims to unlock the genetic potential of plant genetic resources for the benefit of Australian grain growers. Find out more about the <a href="https://agg.plantinformatics.io/strategic-partnership/" target="_blank" rel="noopener noreferrer">AGG strategic partnership</a>.
          </p>
        </div>
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">Passport data sourced from <a href="https://www.genesys-pgr.org/" target="_blank" rel="noopener noreferrer">Genesys-PGR</a> via <a href="https://genolink.plantinformatics.io/" target="_blank" rel="noopener noreferrer">Genolink</a>. Use of this service 
            means you agree to the Genesys-PGR <a href="https://www.genesys-pgr.org/content/legal/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> and 
            acknowledge Genesys-PGR as the original source when using passport data via Fairybread.</p>
        </div>
    </div>
  )
}