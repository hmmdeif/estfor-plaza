<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 w-full md:basis-3/4 xl:basis-1/2"
    >
        <div class="card-body">
            <div>
                You currently have
                <span class="text-lg text-success">{{
                    emptySilos.length
                }}</span>
                empty silos. Each silo can house
                <span class="text-lg text-success">1</span> hero.
            </div>
            <div>
                <button class="btn btn-primary mt-5 me-2" @click="depositHeroes">Deposit Heroes</button>
            </div>
            <div>
                <div class="flex flex-col justify-start mt-5">
                    <label
                        class="form-control w-full"
                        v-for="(h, i) in heroesToMint"
                        :key="i"
                    >
                        <div class="label">
                            <span class="text-sm">Hero #{{ i + 1 }}</span>
                        </div>
                        <div class="join items-center">
                            <input
                                type="text"
                                placeholder="Hero name"
                                class="input input-bordered w-full bg-base-100-50"
                                v-model="h.name"
                                @input="h.error = ''"
                            />
                            <AvatarSelect
                                :options="avatars"
                                v-model="h.avatarId"
                                class="ms-2"
                            />
                            <button
                                type="button"
                                class="btn btn-error btn-outline ms-2"
                                @click="heroesToMint.splice(i, 1)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="w-6 h-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div class="label">
                            <span class="text-sm text-error">{{
                                h.error
                            }}</span>
                        </div>
                    </label>
                </div>
                <div class="flex items-end gap-2 mt-2">
                    <label class="form-control w-full">
                        <div class="label">
                            <span class="text-sm">Number of Heroes</span>
                        </div>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            class="input input-bordered bg-base-100-50"
                            v-model="quickAddNumber"
                        />
                    </label>
                    <AvatarSelect
                        :options="avatars"
                        v-model="quickAddAvatarId"
                    />
                    <button
                        type="button"
                        class="btn btn-primary mt-5 me-2"
                        @click="quickAddHeroes"
                    >
                        Quick Add
                    </button>
                </div>
                <div class="flex">
                    <button
                        type="button"
                        class="btn btn-primary mt-5 me-2"
                        @click="addHero"
                        :disabled="
                            mintingHeroes ||
                            heroesToMint.length >= emptySilos.length
                        "
                    >
                        Add Hero
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary mt-5 grow"
                        @click="mintHeroes"
                        :disabled="mintingHeroes || heroesToMint.length === 0"
                    >
                        Mint {{ heroesToMint.length }} Hero{{
                            heroesToMint.length > 1 ? "es" : ""
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <DepositHeroes
        ref="depositHeroesRef"
        id="deposit_heroes_modal"
        :chainId="props.chainId"
    />
</template>

<script setup lang="ts">
import { useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { computed, onMounted, ref } from "vue"
import { getAvatars, getExactPlayers } from "../../utils/api"
import { avatarBoostSkills } from "../../store/core"
import AvatarSelect from "../inputs/AvatarSelect.vue"
import DepositHeroes from "../dialogs/DepositHeroes.vue"
import type { SonicChainId } from "../../config"

const emit = defineEmits(["create-heroes"])

const props = defineProps<{
    chainId: SonicChainId
}>()

const factoryStore = useFactoryStore()
const app = useAppStore()
const mintingHeroes = ref(false)
const heroesToMint = ref([{ name: "", error: "", avatarId: 1 }])
const avatars = ref<any[]>([])

const quickAddNumber = ref(1)
const quickAddAvatarId = ref(1)

const quickAddHeroes = () => {
    for (let i = 0; i < quickAddNumber.value; i++) {
        heroesToMint.value.push({
            name: "",
            error: "",
            avatarId: quickAddAvatarId.value,
        })
    }
}

const emptySilos = computed(() => factoryStore.emptyProxys)

const depositHeroesRef = ref<typeof DepositHeroes>()

const depositHeroes = () => {
    depositHeroesRef.value?.openDialog()
}

const mintHeroes = async () => {
    for (const hero of heroesToMint.value) {
        hero.error = ""
        if (hero.name === "") {
            hero.error = "Name cannot be empty"
            continue
        }
        const exists = await getExactPlayers(hero.name.trim())
        if (exists.players.length > 0) {
            hero.error = "Name not unique"
        }
    }

    if (heroesToMint.value.some((h) => h.error !== "")) {
        return
    }

    mintingHeroes.value = true
    try {
        await factoryStore.mintHeroes(heroesToMint.value, props.chainId)
        app.addToast(
            `${heroesToMint.value.length} hero${
                heroesToMint.value.length > 1 ? "es" : ""
            } minted`,
            "alert-success",
            5000
        )
        heroesToMint.value = [{ name: "", error: "", avatarId: 1 }]
        emit("create-heroes")
    } catch {
    } finally {
        mintingHeroes.value = false
    }
}

const addHero = () => {
    heroesToMint.value.push({ name: "", error: "", avatarId: 1 })
}

const init = async () => {
    const avatarsResult = await getAvatars()
    avatars.value = avatarsResult.avatars
        .map((a) => {
            return {
                id: parseInt(a.id),
                boostSkills: (avatarBoostSkills as any)[parseInt(a.id)] || [],
            }
        })
        .filter((a) => a.id < 10000)
}

onMounted(init)
</script>
