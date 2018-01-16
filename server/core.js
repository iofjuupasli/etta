const _ = require(`lodash/fp`);

const log = (v) => {
    console.log(JSON.stringify(v, null, 2));
};

const colors = [`red`, `green`, `blue`, `yellow`];
const numbers = [1, 2, 3, 4];
const shapes = [`cross`, `square`, `circle`, `triangle`];

const deck = _.flatMap(
    (color) => _.flatMap(
        (number) => _.map(
            (shape) => ({color, number, shape}),
            shapes
        ),
        numbers
    ),
    colors
);


const createGame = (playersCount) => {
    const shuffled = _.shuffle(_.shuffle(deck));
    const game = {
        deck: _.slice(playersCount * 4 + 1, shuffled.length, shuffled),
        players: _.times((i) => ({
            id: i + 1, cards: _.slice(i * 4, (i + 1) * 4, shuffled)
        }), playersCount),
        board: [
            {
                x: 0,
                y: 0,
                card: shuffled[playersCount * 4],
            },
        ],
    };
    return game;
};

const game = createGame(2);

const isSameCoord = (coordName, line) => {
    const values = _.uniq(_.map(coordName, line));
    return values.length === 1;
}

const validateLine = (line) => {
    if (line.length > 4 || line.length < 1) {
        return false;
    }
    const xs = _.uniq(_.map(`x`, line));
    const ys = _.uniq(_.map(`y`, line));
    if (!isSameCoord(`x`, line) && !isSameCoord(`y`, line)) {
        return false;
    }
    if (xs.length !== line.length && ys.length !== line.length) {
        return false;
    }
    if ((_.max(xs) - _.min(xs)) !== (line.length - 1) &&
        (_.max(ys) - _.min(ys)) !== (line.length - 1)) {
        return false;
    }
    const cards = _.reduce((result, card) => {
        return {
            color: _.uniq(_.concat(result.color, [card.color])),
            number: _.uniq(_.concat(result.number, [card.number])),
            shape: _.uniq(_.concat(result.shape, [card.shape])),
        };
    }, {color: [], number: [], shape: []}, _.map(`card`, line));
    const allUniq = _.pipe(
        _.values,
        _.every((v) => v.length === line.length),
    )(cards);
    const someShared = _.pipe(
        _.values,
        _.some((v) => v.length === 1),
    )(cards);
    if (!allUniq && !someShared) {
        return false;
    }
    return true;
};

const getLinesForItem = (board, item) => {
    const horizontalLine = [];
    const verticalLine = [];
    let {x, y} = item;
    for(let {x, y} = item, nextItem = _.find({x, y}, board); nextItem; nextItem = _.find({x: --x, y}, board)) {
        horizontalLine.push(nextItem);
    }
    for(let {x, y} = item, nextItem = _.find({x, y}, board); nextItem; nextItem = _.find({x: ++x, y}, board)) {
        if (item.x === nextItem.x) {
            continue;
        }
        horizontalLine.push(nextItem);
    }
    for(let {x, y} = item, nextItem = _.find({x, y}, board); nextItem; nextItem = _.find({x, y: --y}, board)) {
        verticalLine.push(nextItem);
    }
    for(let {x, y} = item, nextItem = _.find({x, y}, board); nextItem; nextItem = _.find({x, y: ++y}, board)) {
        if (item.y === nextItem.y) {
            continue;
        }
        verticalLine.push(nextItem);
    }
    const lines = _.filter((line) => line.length > 1, [horizontalLine, verticalLine]);
    return lines;
};

getLinesForItem([
    {x: 0, y: -1},
    {x: 1, y: -1},
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: -1, y: 2},
], {x: 0, y: 0});//?

const isConnected = (board, line) => {
    // all items should be in lines of one of item
    const [item, ...items] = line;
    const lineItems = _.flatten(getLinesForItem(board, item));
    return _.every((secondItem) => {
        const {x, y} = secondItem;
        return _.find({x, y}, lineItems);
    }, items);
};

const isConnectedToBoard = (board, line) => {
    // count of items in all lines should be greater than line.length ^ 2
    const allLineItems = _.flatMap((item) => getLinesForItem(board, item), line);
    if (allLineItems.length <= (line.length * line.length)) {
        return false;
    }
    return true;
};

const validateNewLine = (board, line) => {
    if (!isSameCoord(`x`, line) && !isSameCoord(`y`, line)) {
        return false;
    }
    if (!isConnected(board, line)) {
        return false;
    }
    if (!isConnectedToBoard(board, line)) {
        return false;
    }
    return true;
};

const addLineToBoard = (game, activePlayer, line) => {
    // validate
    return {
        deck: _.drop(line.length, game.deck),
        players: _.map((player) => {
            if (player.id === activePlayer.id) {
                return {
                    ...player,
                    cards: _.pipe(
                        _.reject((card) => _.find(card, _.map(`card`, line))),
                        _.concat(_.take(line.length, game.deck))
                    )(player.cards),
                };
            }
            return player;
        }, game.players),
        board: _.concat(game.board, line),
    };
};

const step = addLineToBoard(game, game.players[0], [
    {x: 0, y: -1, card: game.players[0].cards[0]},
    {x: 0, y: -2, card: game.players[0].cards[1]},
]);

log(step.board);
validateLine(step.board)
