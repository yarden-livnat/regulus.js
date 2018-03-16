from math import floor, ceil


def scheduler(spec):
    when = []
    num = []
    what = []
    demand = spec.demand

    lwr_units, fr_units = spec.supply
    lwr_cap, fr_cap = spec.capacity
    lwr_lifetime, fr_lifetime = spec.lifetime

    n_lwr = 0
    n_fr = 0

    for year in range(spec.years):
        n_lwr += lwr_units[year]
        n_fr += fr_units[year]

        gap = demand[year]*(1+spec.bias) - n_lwr * lwr_cap - n_fr * fr_cap
        if gap <= 0:
            continue

        if year >= spec.fr_start:
            can_support = max(floor(n_lwr/spec.lwr_fr) + floor(n_fr/spec.fr_fr) - n_fr, 0)
            need = ceil(gap/fr_cap)

            build_fr = min(need, can_support)
        else:
            build_fr = 0

        build_lwr = max(ceil((gap - build_fr * fr_cap)/lwr_cap), 0)

        if build_lwr > 0 and year + lwr_lifetime < spec.years:
            lwr_units[year + lwr_lifetime] -= build_lwr

        if build_fr > 0 and year + fr_lifetime < spec.years:
            fr_units[year + fr_lifetime] -= build_fr

        n_lwr += build_lwr
        n_fr += build_fr

        if build_lwr > 0:
            when.append(year*12+1)
            num.append(build_lwr)
            what.append('lwr')
        if build_fr > 0:
            when.append(year*12+1)
            num.append(build_fr)
            what.append('fr')

    return when, num, what
