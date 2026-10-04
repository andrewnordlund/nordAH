rm build/nordAH.xpi
cd src
zip -r ../build/nordAH.xpi manifest.json nordAH-bg.js _locales libs content_scripts icons options popup results -x *.swp *.DS_Store "*~"
cd ..
