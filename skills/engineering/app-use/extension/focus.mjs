const marker=location.hash.slice(1);
if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(marker))document.title='app-use focus '+marker;
