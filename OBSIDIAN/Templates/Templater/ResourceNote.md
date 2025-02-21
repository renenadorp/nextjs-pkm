<%-* ResourcesFolder="Resources" -%>
<%-* Type = await tp.system.suggester(["Book", "Webpage", "JournalArticle", "Document"], ["Book", "Webpage","JournalArticle","Document"], true, "Type") -%>
<%-* Title=await tp.system.prompt("Title") -%>
<%-* Author=await tp.system.prompt("Author") -%>
<%-* Year=await tp.system.prompt("Year") -%>
<%-* Topic=await tp.system.prompt("Topic") -%>
<%-* KnowledgeArea=await tp.system.prompt("KnowledgeArea") -%>
<%-* URL=await tp.system.prompt("URL") -%>
<%-* Quality = await tp.system.suggester(["High", "Medium", "Low"], ["High", "Medium", "Low"], true, "Quality") -%>
<%-* NoteCreationDate=tp.date.now() -%>
---
Type: <% Type %>
Title: <% Title %>
Author: <% Author %>
Year: <% Year %>
Topic: <% Topic %>
KnowledgeArea: <% KnowledgeArea %>
Publisher: <% Publisher %>
Quality: <% Quality %>

---

# Resource Meta
Type: <% Type %>
Title: <% Title %>
Author: <% Author %>
Year: <% Year %>
Topic: <% Topic %>
KnowledgeArea: <% KnowledgeArea %>
Publisher: <% Publisher %>
Quality: <% Quality %>
<%-*
	
 await tp.file.move(ResourcesFolder  +"/"+ Author   +"_"+  Title   +"_("   +Year+ ")"   ) 
%>
 