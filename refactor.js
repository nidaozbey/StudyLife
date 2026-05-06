const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'OOM' || err.code === 'EMFILE') throw err;
    }
  });
  return filelist;
};

const processFile = (filePath) => {
  if (!filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it imports Colors
  const importMatch = content.match(/import Colors from '([\.\/]+)constants\/colors';?/);
  if (!importMatch) return;
  
  const relativePathPrefix = importMatch[1];
  
  // Replace import
  content = content.replace(
    /import Colors from '[\.\/]+constants\/colors';?/,
    `import { useTheme } from '${relativePathPrefix}context/ThemeContext';`
  );

  // Find StyleSheet.create
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace(
      'const styles = StyleSheet.create({',
      'const getStyles = (Colors) => StyleSheet.create({'
    );
  }

  // Find component definition (Arrow function or regular function)
  // E.g. const AIStudyBuddyScreen = ({ navigation }) => {
  // or export default function App() {
  const compMatch = content.match(/(const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*{|export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{)/);
  
  if (compMatch) {
    const signature = compMatch[1];
    
    // Inject hooks
    const injection = `\n  const { colors: Colors, isDark } = useTheme();\n` + 
                      (content.includes('getStyles') ? `  const styles = getStyles(Colors);\n` : '');
                      
    content = content.replace(signature, signature + injection);
  } else {
    console.log("Could not find component signature in", filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Refactored", filePath);
};

const allFiles = walkSync('./src');
allFiles.push('./App.js');

allFiles.forEach(processFile);
