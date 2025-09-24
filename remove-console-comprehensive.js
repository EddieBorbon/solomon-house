const fs = require('fs');
const path = require('path');

function removeConsoleStatements(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove console.log, console.warn, console.error statements (including commented ones)
    const cleanedContent = content
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        // Remove lines that contain console.log, console.warn, or console.error
        // This includes both active and commented console statements
        return !trimmed.match(/^\s*\/\/?\s*console\.(log|warn|error)/) && 
               !trimmed.match(/^\s*console\.(log|warn|error)/);
      })
      .join('\n');
    
    // Only write if content changed
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let cleanedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      cleanedCount += processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      if (removeConsoleStatements(fullPath)) {
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

// Process src directory
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  const cleanedCount = processDirectory(srcPath);
  console.log(`\nTotal files cleaned: ${cleanedCount}`);
} else {
  console.error('src directory not found');
}
