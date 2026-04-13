export default function BottomFooter() {
  return (
    <div className="flex items-start justify-end mt-6 mb-6 gap-4">
      <div className="mt-auto space-y-6 px-2 pb-3 pt-4">
        <p className="text-sm text-muted-foreground">
          The <a href="https://agg.plantinformatics.io/strategic-partnership/" target="_blank" rel="noopener noreferrer" className="font-bold">Australian Grains Genebank (AGG) Strategic 
          Partnership</a> is a $30M joint investment between the Victorian State Government and 
          the <a href="https://grdc.com.au/" target="_blank" rel="noopener noreferrer" className="font-bold">Grains Research and Development Corporation (GRDC)</a> that 
          aims to unlock the genetic potential of plant genetic resources for the benefit of Australian grain growers.
        </p>
        <p className="text-sm text-muted-foreground">Passport data sourced from <a href="https://www.genesys-pgr.org/" target="_blank" rel="noopener noreferrer" className="font-bold">Genesys-PGR</a> via <a href="https://genolink.plantinformatics.io/" target="_blank" rel="noopener noreferrer">Genolink</a>. Use of this service 
          means you agree to the Genesys-PGR <a href="https://www.genesys-pgr.org/content/legal/terms" target="_blank" rel="noopener noreferrer" className="font-bold">Terms and Conditions</a> and 
          acknowledge Genesys-PGR as the original source when using passport data via Fairybread.
        </p>
      </div>
      <img src="/agvic_grdc.svg" alt="" className="w-2/5"/>
    </div>
  )
}