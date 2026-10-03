rm build/nordAH.xpi
zip -r build/nordAH.xpi src/manifest.json src/nordAH-bg.js src/_locales src/libs src/content_scripts src/icons src/options src/popup src/results -x *.swp *.DS_Store "*~"
