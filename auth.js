
const apiKeys = [
    { user: 'them', key: '' }
];

export function authorize(req, res, next) {
    if (req.authorization?.basic) {
        let found = false;

        for (let auth of apiKeys) {
            if (auth.key === req.authorization.basic.password &&
                auth.user === req.authorization.basic.username) {
                found = true;
                break;
            }
        }

        if (found) {
            next();
        } else {
            res.send(401, new Error('Not authorized'));
            next(false);
        }
    } else {
        res.send(500, new Error('No Authorization Key'));
        next(false);
    }
}
