-- This resource was made by plesalex100#7387
-- Please respect it, don't repost it without my permission
-- This Resource started from: https://codepen.io/AdrianSandu/pen/MyBQYz
-- ESX Version: saNhje & wUNDER
-- Rewritten from ESX to QB: Revoxxi
local QBCore = exports['qb-core']:GetCoreObject()
local PlayerData                = {}
local playerUpdate			    = false
local open 						= false

Citizen.CreateThread(function()
    if playerUpdate == false then
        PlayerData = QBCore.Functions.GetPlayerData()
        CreateBlip()
		playerUpdate = true
    end
end)

-------------------------------------------------------------------------------
-- FUNCTIONS
-------------------------------------------------------------------------------
local function drawHint(text)
	SetTextComponentFormat("STRING")
	AddTextComponentString(text)
	DisplayHelpTextFromStringLabel(0, 0, 1, -1)
end

function CreateBlip()
	if Config.blipsEnabled then
		for k,v in ipairs(Config.Slots)do
			local blip = AddBlipForCoord(v.x, v.y, v.z)
			SetBlipSprite(blip, 436)
			SetBlipDisplay(blip, 4)
			SetBlipScale(blip, 1.0)
			SetBlipColour(blip, 49)
			SetBlipAsShortRange(blip, true)
			BeginTextCommandSetBlipName("STRING")
			AddTextComponentString("Slotmachine")
			EndTextCommandSetBlipName(blip)
		end
	end
end

function KeyboardInput(textEntry, inputText, maxLength)
    AddTextEntry('FMMC_KEY_TIP1', textEntry)
    DisplayOnscreenKeyboard(1, "FMMC_KEY_TIP1", "", inputText, "", "", "", maxLength)

    while UpdateOnscreenKeyboard() ~= 1 and UpdateOnscreenKeyboard() ~= 2 do
        Citizen.Wait(0)
    end

    if UpdateOnscreenKeyboard() ~= 2 then
        local result = GetOnscreenKeyboardResult()
        Citizen.Wait(500)
        return result
    else
        Citizen.Wait(500)
        return nil
    end
end

-------------------------------------------------------------------------------
-- NET EVENTS
-------------------------------------------------------------------------------
RegisterNetEvent("qb-slots:enterBets")
AddEventHandler("qb-slots:enterBets", function ()
    local bets = KeyboardInput("Enter bet value:", "", Config.MaxBetNumbers)
    if tonumber(bets) ~= nil then
    	TriggerServerEvent('qb-slots:BetsAndMoney', tonumber(bets))
    else
		QBCore.Functions.Notify('You need to enter numbers (9999 is max bet).', "error")
    end
end)

RegisterNetEvent("qb-slots:UpdateSlots")
AddEventHandler("qb-slots:UpdateSlots", function(lei)
	SetNuiFocus(true, true)
	open = true
	SendNUIMessage({
		showPacanele = "open",
		coinAmount = tonumber(lei)
	})
end)

-------------------------------------------------------------------------------
-- NUI CALLBACKS
-------------------------------------------------------------------------------
RegisterNUICallback('exitWith', function(data, cb)
	cb('ok')
	TriggerServerEvent("qb-slots:PayOutRewards", GetPlayerServerId(PlayerId()), data.coinAmount)
	open = false
	SetNuiFocus(false, false)
end)

-------------------------------------------------------------------------------
-- THREADS
-------------------------------------------------------------------------------
Citizen.CreateThread(function ()
	SetNuiFocus(false, false)
	open = false
	local wTime = 500
	local x = 1
	while true do
		Citizen.Wait(wTime)
		langaAparat = false

		for i=1, #Config.Slots, 1 do
			if GetDistanceBetweenCoords(GetEntityCoords(GetPlayerPed(-1)), Config.Slots[i].x, Config.Slots[i].y, Config.Slots[i].z, true) < 2  then
				x = i
				wTime = 0
				langaAparat = true
				if not open then
					DrawText3Ds(Config.Slots[i].x, Config.Slots[i].y, Config.Slots[i].z - 0.3, 'Press ~g~E~w~ to test your luck.')
				end
			elseif GetDistanceBetweenCoords(GetEntityCoords(GetPlayerPed(-1)), Config.Slots[x].x, Config.Slots[x].y, Config.Slots[x].z, true) > 4 then
				wTime = 500
			end
		end
	end
end)

Citizen.CreateThread(function ()
	while true do
		Citizen.Wait(1)
		if open then
			DisableControlAction(0, 1, true) -- LookLeftRight
			DisableControlAction(0, 2, true) -- LookUpDown
			DisableControlAction(0, 24, true) -- Attack
			DisablePlayerFiring(GetPlayerPed(-1), true) -- Disable weapon firing
			DisableControlAction(0, 142, true) -- MeleeAttackAlternate
			DisableControlAction(0, 106, true) -- VehicleMouseControlOverride
		elseif IsControlJustReleased(0, 38) and langaAparat then
			TriggerEvent('qb-slots:enterBets')
		end
	end
end)


function DrawText3Ds(x, y, z, text)
	SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x,y,z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0+0.0125, 0.017+ factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end