import React from 'react';
import {render} from 'react-dom';

const Game = () => (
    <div>
        <Header />
        <Board />
        <Panel />
    </div>
);

render(
    (<Game />),
    document.getElementById(`main`),
);
