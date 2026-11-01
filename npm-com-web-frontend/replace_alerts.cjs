const fs = require('fs');
const processFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replace(/alert\('([^']+)'\);?/g, "Swal.fire({ icon: 'info', title: '$1', timer: 2000, showConfirmButton: false })");
  content = content.replace(/alert\(\`([^\`]+)\`\);?/g, "Swal.fire({ icon: 'info', title: `$1`, timer: 2000, showConfirmButton: false })");
  content = content.replace(/alert\(\"([^\"]+)\"\);?/g, 'Swal.fire({ icon: "info", title: "$1", timer: 2000, showConfirmButton: false })');
  
  content = content.replace(/Swal\.fire\(\{\s*icon:\s*'info',\s*title:\s*(['"\`])(.*?successfully.*?)\1/g, "Swal.fire({ icon: 'success', title: $1$2$1");
  content = content.replace(/Swal\.fire\(\{\s*icon:\s*'info',\s*title:\s*(['"\`])(.*?Failed.*?)\1/g, "Swal.fire({ icon: 'error', title: $1$2$1");
  content = content.replace(/Swal\.fire\(\{\s*icon:\s*'info',\s*title:\s*(['"\`])(.*?error.*?)\1/gi, "Swal.fire({ icon: 'error', title: $1$2$1");
  
  const confirmReplacement = `    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b', confirmButtonText: 'Yes, delete it!' });
    if (!result.isConfirmed) return;`;
  
  content = content.replace(/if\(\s*\!?window\.confirm\([^)]+\)\s*\)\s*return;/g, confirmReplacement);
  
  if (!content.includes('import Swal')) {
    content = content.replace(/(import React.*?;\n)/, "$1import Swal from 'sweetalert2';\n");
  }
  
  fs.writeFileSync(path, content);
  console.log(`Processed ${path}`);
};

processFile('src/pages/Dashboard/ContentManagement.jsx');
processFile('src/pages/DataEntry/ResultsEntry.jsx');
processFile('src/pages/DataEntry/TeacherStats.jsx');
processFile('src/pages/DataEntry/StudentStats.jsx');
