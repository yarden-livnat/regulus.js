import sqlite3

nuc_names = ['U', 'Np', 'Pu', 'Am', 'Cm']


def total_power(c, row, header):
    c.execute('''select tl.year, ifnull(p.power, 0) as power from
                (select distinct (time-1)/12 as year from timelist )as tl
                left join (
                    select time/12 as year, sum(value)/12 as power from TimeSeriesPower group by year
                ) as p on tl.year = p.year''')
    total = c.fetchone()
    row.append(total[0])


def excess(c, row, header, demand):
    c.execute('''select ifnull(p.power, 0) as power from
                    (select distinct (time-1)/12 as year from timelist) as tl
                    left join (
                        select (time-1)/12 as year, sum(value)/12 as power from TimeSeriesPower group by year
                    ) as p on tl.year = p.year''')
    power_series = c.fetchall()

    years = len(power_series)
    total = 0
    max_per_year = None
    for year in range(years):
        e = power_series[year][0] - demand[year]
        total += e
        max_per_year = max(max_per_year, e) if max_per_year is not None else e
    row.append(total)
    row.append(max_per_year)


def waste(c, row, header, *args):
    c.execute('''select SUM(inv.Quantity * c.MassFrac) AS qty, c.nucid /10000000 as id
                from
                (select * 
                    from Inventories 
                    where agentid in (select agentid from agents where prototype = 'sink')
                        and starttime <= (select max(time) from timelist) and endtime > (select max(time) from timelist)
                ) as  inv
                join (select nucid, MassFrac, qualid from Compositions where nucid >= 920000000) as c on c.qualid = inv.qualid
                group by id
        ''')
    waste_series = c.fetchall()

    w = [0] * len(nuc_names)
    last = 92 + len(nuc_names)
    for qty, nucid in waste_series:
        if nucid < last:
            w[nucid-92] = qty
    row.extend(w)


MEASURES = [
    # {'measures': 'total_power', 'f': total_power},
    {'measures': ['excess', 'max_excess'], 'f': excess},
    {'measures': ['waste_' + name for name in nuc_names], 'f': waste}
]


class Measures(object):
    def __init__(self, demand):
        self.demand = demand
        self.header = []

        for measure in MEASURES:
            names = measure['measures']
            if type(names) == str:
                self.header.append(names)
            else:
                self.header.extend(names)

    def compute(self, filename):
        conn = sqlite3.connect(filename)
        c = conn.cursor()

        values = []
        for measure in MEASURES:
            measure['f'](c, values, self.header, self.demand)

        conn.close()
        return values
