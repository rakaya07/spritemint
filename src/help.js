import chalk from 'chalk';

export function showHelp() {
  console.log(`
${chalk.bold.green('SpriteMint')} ${chalk.gray('— Unity Sprite Processor')}

${chalk.bold('USAGE')}
  ${chalk.cyan('spritemint')}           Interactive mode (main menu)
  ${chalk.cyan('spritemint --help')}    Show this help message
  ${chalk.cyan('spritemint -h')}        Show this help message

${chalk.bold('COMMANDS')} ${chalk.gray('(selected interactively)')}

  ${chalk.yellow('1. Normalize Sprites')}
     PNG dosyalarını kare canvas'a sığdırır.
     Aspect ratio korunur, şeffaf padding eklenir.
     Çıktı: ${chalk.gray('<klasör>/normalized/')}

  ${chalk.yellow('2. Extract Sprites from Sheet & Build Horizontal Output')}
     Grid tabanlı sprite sheet'ten kareleri çıkarır,
     normalize eder ve yatay bir animasyon strip'i oluşturur.
     Çıktı: ${chalk.gray('<klasör>/output_horizontal.png')}

  ${chalk.yellow('3. Build Sprite Sheet from Selected PNGs')}
     Birden fazla PNG dosyasını seçerek yeni bir sprite sheet'e
     birleştirir. Yatay strip veya grid layout seçilebilir.
     Çıktı: ${chalk.gray('<klasör>/spritesheet_output.png')}

${chalk.bold('REQUIREMENTS')}
  - PNG formatında görsel dosyalar
  - Node.js v18+

${chalk.bold('EXAMPLES')}
  ${chalk.gray('# Aracı başlat ve interaktif menüden seç')}
  ${chalk.cyan('spritemint')}

  ${chalk.gray('# Yardım mesajını göster')}
  ${chalk.cyan('spritemint --help')}

${chalk.bold('LINKS')}
  GitHub   ${chalk.underline('https://github.com/rakaya07/spritemint')}
  License  MIT
`);
}
