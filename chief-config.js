// Apply bounds before legacy load/progression normalization, so high-level saves survive reload.
BUILD.warehouse.max=20;BUILD.hut.max=12;BUILD.lantern.max=8;BUILD.watchtower.max=10;BUILD.lumber.max=12;BUILD.quarry.max=12;

// Import Pocket once; a deliberate new-game reset must not resurrect the old village.
if(!document.body.dataset.world)try{if(localStorage.getItem((document.body.dataset.save+'-imported')))delete document.body.dataset.importSave;else localStorage.setItem((document.body.dataset.save+'-imported'),'1')}catch{}
