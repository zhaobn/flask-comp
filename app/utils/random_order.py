'''

Options to specify a sequence.

Random() will randomise order of args.
Random(take=n) will take n items in random order.

Fixed() outputs args in sequence.


Random and Fixed are freely embeddable within each other.


'''

from copy import deepcopy
import random


class Random:
    def __init__(self, *args, take=None):
        self.choices = list(args)
        self.num = take


    def __iter__(self):
        c = deepcopy(self.choices)

        if not self.num:
            self.num = len(c)

        while c and self.num:
            item = c.pop(random.randrange(len(c)))
            if type(item) in (Random, Fixed):
                yield from item
            else:
                yield item
            self.num -= 1

    def __len__(self):
        return self.num or len(self.choices)
        

class Fixed:
    def __init__(self, *args):
        self.fixed = list(args)

    def __iter__(self):
        for item in self.fixed:
            if type(item) in (Random, Fixed):
                yield from item
            else:
                yield item

    def __len__(self):
        return len(self.fixed)
