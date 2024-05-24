const { createApp } = Vue;

createApp({
    data() {
        return {
            digimons: [],
            loading: true,
            searchText: '',
            selectedDigimon: null,
            modalVisible: false
        }
    },
    computed: {
        filtredDigimons(){
            return this.digimons.filter(digimon => digimon.name.toLowerCase().includes(this.searchText.toLowerCase()))
        }
    },
    created() {
        this.fetchDigimons();
        window.addEventListener('scroll', this.handleScroll)
    },
    destroyed() {
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
        async fetchDigimons() {
            try {
                const response = await fetch(`https://digimon-api.vercel.app/api/digimon`)
                const data = await response.json();
                const digimonDetailsPromises = data.map(async digimon => this.fetchDigimonData(`https://digimon-api.vercel.app/api/digimon/name/` + digimon.name))
                const digimonDetails = await Promise.all(digimonDetailsPromises)
                this.digimons = [... this.digimons, ... data];
                this.loading = false;
            } catch (error) {
                console.error(error)
            }
        },
        async fetchDigimonData(url){
            try {
                const response = await fetch(url);
                const data = await response.json();
                return {
                    name: data.name,
                    img: data.img,
                    level: data.level
                }
            } catch (error) {
                console.error(error)
            }
        },
        getLevelClass(level) {
            const levelMap = {
                fresh: 'Fresh',
                inTraining: 'In Training',
                rookie: 'Rookie',
                champion: 'Champion',
                ultimate: 'Ultimate',
                mega: 'Mega',
                armor: 'Armor'
            }

            // Normalizando a entrada do level para lidar com variações do 'In Training'
            // (descobri pelas wikis que basicamente são a mesma coisa, não sei por que a API fez diferenciação)
            if (level === 'Training') {
                level = 'In Training';
            }

            return Object.keys(levelMap).find(key => levelMap[key] === level) || ''
        },
        handleScroll() {
            const bottomOfWindow =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;

            if (bottomOfWindow && !this.loading) {
                this.loading = true;
                this.fetchDigimons();
            }
        },
        openModal(digimon) {
            this.selectedDigimon = digimon;
            this.modalVisible = true;
        },
        closeModal() {
            this.modalVisible = false;
        }
    }

}).mount("#app");