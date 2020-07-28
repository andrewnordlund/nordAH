rm nordAH.xpi
zip -r nordAH.xpi manifest.json nordAH-bg.js _locales libs content_scripts icons options popup results -x *.swp *.DS_Store "*~"
