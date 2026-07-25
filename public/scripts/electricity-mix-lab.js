const lab = document.querySelector('[data-electricity-mix-lab]');

if (lab) {
  const profileInput = lab.querySelector('[data-mix-profile-input]');
  const snapshotInput = lab.querySelector('[data-mix-snapshot-input]');
  const sourceRows = Array.from(lab.querySelectorAll('[data-mix-source]'));

  const output = {
    status: lab.querySelector('[data-mix-status]'),
    profileName: lab.querySelector('[data-mix-profile-name]'),
    profileNote: lab.querySelector('[data-mix-profile-note]'),
    profileFactors: lab.querySelector('[data-mix-profile-factors]'),
    snapshotName: lab.querySelector('[data-mix-snapshot-name]'),
    demand: Array.from(lab.querySelectorAll('[data-mix-demand]')),
    generation: lab.querySelector('[data-mix-generation]'),
    storage: lab.querySelector('[data-mix-storage]'),
    balance: lab.querySelector('[data-mix-balance]'),
    storageNote: lab.querySelector('[data-mix-storage-note]'),
  };

  const profiles = {
    solar: {
      name: 'Sun-rich, limited hydro',
      note: 'Strong sunlight and recent solar build-out create a large solar fleet. Limited hydro means flexible generation and storage matter more after sunset.',
      factors: ['strong solar resource', 'recent solar investment', 'limited hydro sites'],
      capacity: { solar: 120, wind: 50, hydro: 30, flexible: 70 },
      snapshots: {
        afternoon: { demand: 110, solar: 90, wind: 10, hydro: 15, flexible: 0, storage: -5 },
        evening: { demand: 105, solar: 8, wind: 5, hydro: 24, flexible: 48, storage: 20 },
        night: { demand: 90, solar: 0, wind: 40, hydro: 20, flexible: 20, storage: 10 },
      },
    },
    hydro: {
      name: 'River-rich, established hydro',
      note: 'Water resources and existing dams make hydropower a large part of the fleet. Other sources still complement it as demand and water conditions change.',
      factors: ['river and elevation resources', 'existing dam infrastructure', 'long-lived grid assets'],
      capacity: { solar: 45, wind: 30, hydro: 110, flexible: 25 },
      snapshots: {
        afternoon: { demand: 95, solar: 34, wind: 8, hydro: 60, flexible: 0, storage: -7 },
        evening: { demand: 110, solar: 3, wind: 4, hydro: 85, flexible: 8, storage: 10 },
        night: { demand: 90, solar: 0, wind: 24, hydro: 70, flexible: 0, storage: -4 },
      },
    },
    wind: {
      name: 'Wind-rich, flexible and connected',
      note: 'Strong wind resources support a large wind fleet. Flexible generation, storage, and regional exchange help during calmer periods.',
      factors: ['strong wind resource', 'regional interconnection', 'flexible backup capacity'],
      capacity: { solar: 50, wind: 140, hydro: 20, flexible: 75 },
      snapshots: {
        afternoon: { demand: 90, solar: 38, wind: 28, hydro: 12, flexible: 20, storage: -8 },
        evening: { demand: 115, solar: 4, wind: 14, hydro: 15, flexible: 62, storage: 20 },
        night: { demand: 100, solar: 0, wind: 105, hydro: 10, flexible: 0, storage: -15 },
      },
    },
  };

  const snapshotNames = {
    afternoon: 'Sunny afternoon',
    evening: 'Calm evening',
    night: 'Windy night',
  };

  function formatPower(value) {
    return `${Math.abs(value).toLocaleString()} MW`;
  }

  function replaceList(items) {
    output.profileFactors.replaceChildren();
    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      output.profileFactors.append(listItem);
    });
  }

  function updateLab() {
    const profile = profiles[profileInput.value];
    const snapshot = profile.snapshots[snapshotInput.value];
    const sourceGeneration = snapshot.solar + snapshot.wind + snapshot.hydro + snapshot.flexible;
    const storageAction = snapshot.storage;
    const delivered = sourceGeneration + storageAction;
    const maxCapacity = Math.max(...Object.values(profile.capacity));

    lab.dataset.storageAction = storageAction > 0 ? 'discharging' : storageAction < 0 ? 'charging' : 'idle';

    output.profileName.textContent = profile.name;
    output.profileNote.textContent = profile.note;
    output.snapshotName.textContent = snapshotNames[snapshotInput.value];
    replaceList(profile.factors);

    sourceRows.forEach((row) => {
      const source = row.dataset.mixSource;
      const capacity = profile.capacity[source];
      const generation = snapshot[source];
      const capacityPercent = (capacity / maxCapacity) * 100;
      const generationPercent = (generation / maxCapacity) * 100;
      const utilization = capacity === 0 ? 0 : (generation / capacity) * 100;

      row.querySelector('[data-mix-capacity-value]').textContent = `${capacity} MW installed`;
      row.querySelector('[data-mix-generation-value]').textContent = `${generation} MW now`;
      row.querySelector('[data-mix-utilization]').textContent = `${Math.round(utilization)}% of rating`;
      row.querySelector('[data-mix-capacity-bar]').style.width = `${capacityPercent}%`;
      row.querySelector('[data-mix-generation-bar]').style.width = `${generationPercent}%`;
    });

    output.demand.forEach((node) => {
      node.textContent = formatPower(snapshot.demand);
    });
    output.generation.textContent = formatPower(sourceGeneration);
    output.storage.textContent = storageAction > 0
      ? `Discharging ${formatPower(storageAction)}`
      : storageAction < 0
        ? `Charging ${formatPower(storageAction)}`
        : 'Idle';

    if (storageAction > 0) {
      output.balance.textContent = `${formatPower(sourceGeneration)} generation + ${formatPower(storageAction)} stored discharge = ${formatPower(delivered)} supplied`;
      output.storageNote.textContent = 'The battery fills the remaining gap with energy stored earlier. It does not create new energy.';
    } else if (storageAction < 0) {
      output.balance.textContent = `${formatPower(sourceGeneration)} generation - ${formatPower(storageAction)} charging = ${formatPower(delivered)} supplied`;
      output.storageNote.textContent = 'Generation exceeds current demand, so the battery stores part of the surplus for later use.';
    } else {
      output.balance.textContent = `${formatPower(sourceGeneration)} generation = ${formatPower(delivered)} supplied`;
      output.storageNote.textContent = 'Generation meets demand in this snapshot without battery charging or discharge.';
    }

    const balanceMatches = delivered === snapshot.demand;
    output.status.textContent = balanceMatches
      ? `${snapshotNames[snapshotInput.value]}: the portfolio supplies ${formatPower(snapshot.demand)} of demand.`
      : `${snapshotNames[snapshotInput.value]}: this simplified snapshot has a ${formatPower(snapshot.demand - delivered)} gap.`;
  }

  profileInput.addEventListener('change', updateLab);
  snapshotInput.addEventListener('change', updateLab);
  updateLab();
}
