
```dataview
//Get resources for KnowledgeArea
// Knowledge area = parent folder name.

TABLE WITHOUT ID 
file.link  as File, 
file.frontmatter.Author as Author,
file.frontmatter.Title as Title,
file.frontmatter.Year as Year,

regexreplace(this.file.folder, ".*\/([^\/]+)$", "$1") as KnowledgeArea
FROM "Resources"
WHERE file.frontmatter.KnowledgeArea = KnowledgeArea
```

