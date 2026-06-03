import fs from 'fs'
import path from 'path'
const file = path.join(process.cwd(), '../frontend/src/components/dashboard/create-job-modal.tsx')
let content = fs.readFileSync(file, 'utf8')

// Replace Job Poster text input with a file input
const newPosterInput = `
                <div className="space-y-2">
                  <Label htmlFor="job_poster">Job Poster Image (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="job_poster"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const formData = new FormData()
                          formData.append('poster', file)
                          try {
                            const token = localStorage.getItem('token')
                            const res = await fetch('/api/upload/job-poster', {
                              method: 'POST',
                              headers: { 'Authorization': 'Bearer ' + token },
                              body: formData
                            })
                            const data = await res.json()
                            if (res.ok && data.url) {
                              handleInputChange('job_poster_url', data.url)
                            }
                          } catch (err) {
                            console.error('Failed to upload poster:', err)
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Upload an image to display on the public job board (Max 5MB).</p>
                  {formData.job_poster_url && <p className="text-xs text-green-600">✓ Image uploaded successfully</p>}
                </div>
`
// Replace the old input
content = content.replace(
  /<div className="space-y-2">\s*<Label htmlFor="job_poster_url">Job Poster Image URL \(Optional\)<\/Label>[\s\S]*?<p className="text-xs text-gray-500">Provide a URL for an image to display on the public job board\.<\/p>\s*<\/div>/,
  newPosterInput
)

fs.writeFileSync(file, content)
console.log('Updated create-job-modal.tsx with file upload')
